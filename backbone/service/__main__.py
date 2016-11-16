import cmd
import baker

baker.command(cmd.service, default=True)

if __name__ == '__main__':
    baker.run()
