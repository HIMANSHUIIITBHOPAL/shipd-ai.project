FROM public.ecr.aws/d3j8x8q7/olympus-base:latest

WORKDIR /app

# The repo is already checked out on the host by the evaluation platform
COPY . .

# Pre-install dependencies so we fully satisfy the offline network requirement
RUN npm install
RUN npm install --save-dev @vitest/reporter-junit

CMD ["/bin/bash"]
