FROM python:3.9

WORKDIR /keyRoleBindingService

COPY . /keyRoleBindingService/

RUN apt-get update && apt-get install -y python3-dev libldap2-dev libsasl2-dev libssl-dev
RUN pip install -r requirements.txt
RUN mkdir -p /keyRoleBindingService/logs

CMD [ "python3", "run.py"]