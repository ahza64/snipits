from service import Service

def on_request(msg, reply):
    try:
        reply(['test', 'reply'])
    except Exception as e:
        print "Caught Exception", type(e), e
        reply("Exception")
    except TypeError as e:
        print "Caught Error", str(e)
        reply("ERROR")


if __name__ == '__main__':
    import baker
    @baker.command(default=True)
    def test():
        s = Service('test', on_request)
        s.start()

    baker.run()