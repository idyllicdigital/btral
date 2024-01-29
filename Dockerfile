FROM go:1.21 as builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
EXPOSE 3000
WORKDIR /app
COPY --from=builder /app/main .
CMD ["./main"]
