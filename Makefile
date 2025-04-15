install-backend:
	powershell -Command "Set-ExecutionPolicy Bypass -Scope Process; cd backend; .\install.ps1"

install-frontend:
	powershell -Command "Set-ExecutionPolicy Bypass -Scope Process; cd frontend; .\install.ps1"

install: install-backend install-frontend

run-backend:
	powershell -Command "Set-ExecutionPolicy Bypass -Scope Process; cd backend; .\run.ps1"

run-frontend:
	powershell -Command "Set-ExecutionPolicy Bypass -Scope Process; cd frontend; .\run.ps1"

.DEFAULT_GOAL := install
