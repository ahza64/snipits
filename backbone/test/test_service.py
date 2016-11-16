from service import Service

class TestService(Service):
    def __init__(self):
        super(TestService, self).__init__("tcp://127.0.0.1:5555", 'test')

    def on_request(self, msg):
        try:
            self.reply(['test', 'reply'])
        except Exception as e:
            print "Caught Exception", type(e), e
            self.reply("Exception")
        except TypeError as e:
            print "Caught Error", str(e)
            self.reply("ERROR")


if __name__ == '__main__':
    import baker
    @baker.command(default=True)
    def test():
        t = TestService()
        t.start()

    baker.run()