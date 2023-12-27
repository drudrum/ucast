FROM python:3.7-alpine
RUN apk add --no-cache gcc curl nodejs npm make g++
RUN pip install --upgrade pip
RUN curl -L https://unpkg.com/@pnpm/self-installer | node
CMD ["node", "-v"]