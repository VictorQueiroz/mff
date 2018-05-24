#ifndef NODE_AST_H_
#define NODE_AST_H_

#include <nan.h>

using namespace v8;

class Ast {
public:
    static void Init(Local<Object> exports);
private:
    static NAN_METHOD(Parse);
};

#endif