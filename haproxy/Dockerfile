FROM haproxy:2.5

# 별도의 HAProxy 설정 파일 복사
COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg

# HAProxy 실행 명령어
CMD ["haproxy", "-f", "/usr/local/etc/haproxy/haproxy.cfg"]
