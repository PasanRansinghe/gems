FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Create a non-root user (optional but recommended)
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership if using non-root user
# RUN chown -R nextjs:nodejs /app

# Use non-root user (optional)
# USER nextjs

EXPOSE 4000

CMD ["npm", "start"]