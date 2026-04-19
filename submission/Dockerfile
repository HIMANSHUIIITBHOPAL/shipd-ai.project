FROM public.ecr.aws/x8v8d7g8/mars-base:latest

# Install Node.js 22 (LTS)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Verify Node.js and npm versions
RUN node --version && npm --version

# Set the working directory
WORKDIR /app

# Clone the repository at the specific commit
RUN git clone https://github.com/Chalarangelo/30-seconds-of-code.git . && \
    git checkout 9a12310b04f59a81af4034731165c86f1678b7dc

# Install all dependencies (cached in image for offline use)
RUN npm install

# Install vitest junit reporter for test output
RUN npm install --save-dev @vitest/reporter-junit 2>/dev/null || true

# Copy the test script
COPY test.sh /app/test.sh
RUN chmod +x /app/test.sh

# Default command
CMD ["/bin/bash"]
