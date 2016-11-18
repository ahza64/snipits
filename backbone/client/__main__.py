from client import request
import baker

if __name__ == '__main__':
    baker.command(request, default=True)
    baker.run()
