rm my_app_log.log
rm my_app_err.log
node appmonitor > my_app_log.log 2> my_app_err.log &