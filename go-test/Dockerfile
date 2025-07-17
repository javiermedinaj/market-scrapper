# Build stage
FROM golang:1.20-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o search_api search_api.go

# Run stage
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/search_api .
COPY data ./data
EXPOSE 8080
CMD ["./search_api"]
