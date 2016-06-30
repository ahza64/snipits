# Makefiles for server and remote host monitoring


### Common to server or remote host
```
# git clone the services repository
$ git clone https://github.com/Dispatchr/services.git

# cd into it
$ cd services/monitoring/

# Depending on if you are on the the nagios server (build.dispatchr.co) or 
# the remote host you want to monitor move the file to the home folder
```

### For The remote host 

```
$ mv Makefile.remote ~/Makefile # for remote host
$ sudo make all
# add security group for the remote host to monitor - nagios-server

```

### For The server or build server

```
# for the nagios server or build.dispatchr.co
$ mv Makefile.server ~/Makefile # for build server or nagios server
$ sudo make all HOST=<host_name> # host name can be dev, stage, etc

```
