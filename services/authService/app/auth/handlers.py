from logging import handlers

class PlainTextTcpHandler(handlers.SocketHandler):
    """ Sends plain text log message over TCP channel """


    def makePickle(self, record):
        message = self.formatter.format(record) + "\r\n"
        return message.encode()