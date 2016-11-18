import cmd
import baker

baker.command(cmd.service, default=True, name='cmd-service')

if __name__ == '__main__':
    baker.run()
