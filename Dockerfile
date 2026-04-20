FROM public.ecr.aws/d3j8x8q7/olympus-base:latest

WORKDIR /app
COPY . .

RUN npm install
RUN npm install -g vitest@3.1.1

ENV PATH="/app/node_modules/.bin:$PATH"

CMD ["/bin/bash"]
