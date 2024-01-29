FROM golang:1.21-alpine as builder
WORKDIR /app
COPY go.mod .
COPY main.go .
RUN CGO_ENABLED=0 GOOS=linux go build -o btral .

FROM alpine:latest
WORKDIR /app
EXPOSE 3000
COPY --from=builder /app/btral .
COPY static ./static
CMD ["./btral"]
