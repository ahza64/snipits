BUILDPRIVATE = 172.31.24.37
LOCALHOST = 127.0.0.1
BUILDPUBLIC = 52.10.186.152

CHECK_NRPE = /usr/local/nagios/libexec/check_nrpe

define CHECKMEM_COMMAND
command[check_mem]=/usr/lib/nagios/plugins/check_mem  -f -w 20 -c 10
endef

define NRPESERVICE
service nrpe
{
        flags           = REUSE
        socket_type     = stream
        port            = 5666
        wait            = no
        user            = nagios
        group           = nagios
        server          = /usr/local/nagios/bin/nrpe
        server_args     = -c /usr/local/nagios/etc/nrpe.cfg --inetd
        log_on_failure  += USERID
        disable         = no
        only_from       = $(BUILDPRIVATE) $(LOCALHOST) $(BUILDPUBLIC)
}
endef

export NRPESERVICE
export CHECKMEM_COMMAND

all: nagios_user install_plugins add_permission install_xinetd install_nrpe install_check_mem

nagios_user:
	/usr/sbin/useradd nagios || exit 0;

install_plugins:
	mkdir ~/downloads; \
	cd ~/downloads && \
	wget http://www.nagios-plugins.org/download/nagios-plugins-2.1.1.tar.gz && \
	tar xzf nagios-plugins-2.1.1.tar.gz && \
	cd nagios-plugins-2.1.1/ && \
	./configure && \
	$(MAKE) && \
	$(MAKE) install 

add_permission:
	chown nagios.nagios /usr/local/nagios
	chown -R nagios.nagios /usr/local/nagios/libexec

install_xinetd:
	apt-get update
	apt-get install xinetd

install_nrpe:
	mkdir ~/downloads || exit 0; \
        cd ~/downloads && \
	rm -rf ./nrpe*; \ 
	wget http://pkgs.fedoraproject.org/repo/pkgs/nrpe/nrpe-2.15.tar.gz/3921ddc598312983f604541784b35a50/nrpe-2.15.tar.gz && \
	tar xzf nrpe-2.15.tar.gz && \
	cd nrpe-2.15/ && \
	./configure --with-ssl=/usr/bin/openssl --with-ssl-lib=/usr/lib/x86_64-linux-gnu && \
	$(MAKE) all && \
	$(MAKE) install-plugin && \
	$(MAKE) install-daemon && \
	$(MAKE) install-daemon-config && \
	$(MAKE) install-xinetd && \
	mv /etc/xinetd.d/nrpe /etc/xinetd.d/nrpe.bak && \
	echo "$$NRPESERVICE" > /etc/xinetd.d/nrpe && \
	service xinetd restart && sleep 5 && \
	$(CHECK_NRPE) -H localhost

install_check_mem:
	cd /usr/local/nagios/libexec/ && \
	rm -rf ./check_mem* && \
	wget https://raw.githubusercontent.com/justintime/nagios-plugins/master/check_mem/check_mem.pl && \
	sleep 2 && \
	mv check_mem.pl check_mem && \
	chmod +x check_mem && \
	chown nagios.nagios check_mem && \
	./check_mem -f -w 20 -c 10 && \
	echo "$$CHECKMEM_COMMAND" >> /usr/local/nagios/etc/nrpe.cfg
 

	

	
