#ifndef NODE_AST_H_
#define NODE_AST_H_

#include <nan.h>

using v8::Local;
using v8::Object;

class Ast {
public:
    static void Init(Local<Object> exports);
private:
    static NAN_METHOD(Parse);
};

#define BTC_CHECK_STATUS_VOID(expression) \
    if(expression != BTC_OK) return;

#endif