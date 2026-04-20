FROM public.ecr.aws/d3j8x8q7/olympus-base:latest

WORKDIR /app
COPY . .

RUN npm install

# Add node_modules/.bin to PATH so vitest is always findable regardless of CWD
ENV PATH="/app/node_modules/.bin:$PATH"

CMD ["/bin/bash"]
