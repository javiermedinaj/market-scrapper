# Build stage
FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY . .
RUN cd cmd/api && go build -o api main.go
# Run stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/cmd/api/api .
COPY --from=builder /app/data /app/data
EXPOSE 8080

# Add necessary certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

ENV DATA_PATH=/app
CMD ["./api"]
