import { assert } from 'chai'
import { guard } from '../src'
import { expect } from './specHelper'
import mongoose from 'mongoose'

describe('guard', () => {
  it('creates a mongo query matcher', () => {
    const test = guard({ a: 1 })
    expect(test({ a: 2 })).to.be.false
  })

  it('accepts generic parameter type', () => {
    type Person = { firstName: string }
    const test = guard<Person>({ firstName: { $eq: 'test' } })

    expect(test({ firstName: 'test' })).to.be.true
  })

  it('can compare Dates', () => {
    const now = new Date()
    const test = guard({ createdAt: { $gt: now } })

    expect(test({ createdAt: new Date(now.getTime() + 10) })).to.be.true
    expect(test({ createdAt: now.getTime() + 10 })).to.be.true
    expect(test({ createdAt: now.getTime() - 10 })).to.be.false
  })

  it('can check equality of wrapper objects that have `toJSON` method (e.g., `ObjectId`)', () => {
    const id = <T>(value: T) => ({ value, toJSON: () => value })
    const test = guard({ id: id(1) })

    expect(test({ id: 1 })).to.be.true
    expect(test({ id: id(1) })).to.be.true
    expect(test({ id: id(2) })).to.be.false
  })
  it.only('$not and $size work together', () => {
    const test = guard({ 'a.conditionUids': { $not: { $size: 0 } } })
    expect(test({ a: { conditionUids: [1] } })).to.be.true

    const SubDocSchema = new mongoose.Schema({
      conditionUids: [{ type: String, max: 36 }]
    });
    const TestDocSchema = new mongoose.Schema({
      a: {
        required: true,
        type: SubDocSchema
      }
    });
   
    const TestDocModel = mongoose.model('TestDoc', TestDocSchema);
    const testMongooseDoc = new TestDocModel({ a: { conditionUids: ['test'] } });
    assert(testMongooseDoc)
    assert(testMongooseDoc.a)
    assert(testMongooseDoc.a.conditionUids)
    expect(testMongooseDoc.a.conditionUids.length).to.be.equal(1)
    expect(test(testMongooseDoc as unknown as { a: { conditionUids: string[] } })).to.be.true
  })
})
