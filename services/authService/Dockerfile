FROM python:3.9-slim

RUN apt-get update && apt-get -yq install \
    build-essential \
    python3-dev \
    libldap2-dev \
    libsasl2-dev \
    libssl-dev \
    nginx

WORKDIR /authService

COPY . /authService/

COPY nginx.conf /etc/nginx/nginx.conf

RUN mkdir -p /authService/logs
RUN pip install -r requirements.txt
RUN chmod +x ./startup.sh

EXPOSE 5000

CMD [ "./startup.sh" ]