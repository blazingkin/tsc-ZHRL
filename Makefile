CC=tsc
CFLAGS=-lib es2015
SRC_FILES=src/ZHRL.ts

all: compile

compile: ${SRC_FILES}
	${CC} ${CFLAGS} ${SRC_FILES}