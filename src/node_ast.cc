#include "btc.h"
#include "node_ast.h"
#include <nan.h>

using namespace v8;

namespace Btc {
    namespace Syntax {
        const char* String = "String";
        const char* ContainerDeclaration = "ContainerDeclaration";
        const char* Identifier = "Identifier";
        const char* ContainerGroup = "ContainerGroup";
        const char* Alias = "Alias";
        const char* Template = "Template";
        const char* ContainerParam = "ContainerParam";
        const char* ImportDeclaration = "ImportDeclaration";
        const char* Namespace = "Namespace";
        const char* LiteralString = "LiteralString";
        const char* LiteralNumber = "LiteralNumber";
        const char* MemberExpression = "MemberExpression";
    }
    void ConvertAstItem(btc_ast_item* item, Local<Object> output);
}

void ConvertTypeAlias(btc_alias alias, Local<Object> result) {
    Local<Object> value = Nan::New<Object>();

    result->Set(Nan::New<String>("value").ToLocalChecked(), value);
    result->Set(Nan::New<String>("name").ToLocalChecked(), Nan::New<String>(alias.name.value).ToLocalChecked());
    Btc::ConvertAstItem(alias.value, value);
}

void ConvertLinkedAstList(btc_ast_list* list, Local<Array> output) {
    btc_linked_ast_item* result = list->first_item;

    while(result) {
        Local<Object> item = Nan::New<Object>();
        Btc::ConvertAstItem(result->value, item);
        output->Set(Nan::New<Number>(output->Length()), item);
        result = result->next_item;
    }
}

void ConvertContainerGroup(btc_ast_container_group_declaration* group, Local<Object> output) {
    Local<Array> body = Nan::New<Array>();

    ConvertLinkedAstList(group->body, body);

    output->Set(Nan::New<String>("body").ToLocalChecked(), body);
    output->Set(Nan::New<String>("name").ToLocalChecked(), Nan::New<String>(group->type.value).ToLocalChecked());
}

void ConvertContainerDeclaration(btc_ast_container_declaration* container, Local<Object> output) {
    Local<Array> body = Nan::New<Array>();

    ConvertLinkedAstList(container->body, body);

    output->Set(Nan::New<String>("name").ToLocalChecked(), Nan::New<String>(container->name.value).ToLocalChecked());
    output->Set(Nan::New<String>("containerType").ToLocalChecked(), Nan::New<String>(container->type.value).ToLocalChecked());
    output->Set(Nan::New<String>("body").ToLocalChecked(), body);
}

void ConvertContainerParam(btc_ast_container_param* item, Local<Object> output){
    Local<Object> type = Nan::New<Object>();

    Btc::ConvertAstItem(item->type, type);

    if(item->default_value != NULL) {
        Local<Object> defaultValue = Nan::New<Object>();
        Btc::ConvertAstItem(item->default_value, defaultValue);
        output->Set(Nan::New<String>("default").ToLocalChecked(), defaultValue);
    }

    output->Set(Nan::New<String>("paramType").ToLocalChecked(), type);
    output->Set(Nan::New<String>("name").ToLocalChecked(), Nan::New<String>(item->name.value).ToLocalChecked());
}

void ConvertIdentifier(btc_ast_identifier id, Local<Object> value) {
    value->Set(Nan::New<String>("value").ToLocalChecked(), Nan::New<String>(id.value).ToLocalChecked());
}

void ConvertTemplate(btc_template* tmpl, Local<Object> result) {
    Local<Array> arguments = Nan::New<Array>();

    ConvertLinkedAstList(tmpl->arguments, arguments);

    result->Set(Nan::New<String>("name").ToLocalChecked(), Nan::New<String>(tmpl->name.value).ToLocalChecked());
    result->Set(Nan::New<String>("arguments").ToLocalChecked(), arguments);
}

void ConvertImportDeclaration(btc_import_declaration import, Local<Object> result) {
    result->Set(Nan::New<String>("path").ToLocalChecked(), Nan::New<String>(import.path.value).ToLocalChecked());
}

void ConvertLiteralNumber(btc_number number, Local<Object> result) {   
    result->Set(Nan::New<String>("value").ToLocalChecked(), Nan::New<Number>(number.value));
}

void ConvertLiteralString(btc_string string, Local<Object> result) {
    result->Set(Nan::New<String>("value").ToLocalChecked(), Nan::New<String>(string.value).ToLocalChecked());
}

void ConvertNamespace(btc_namespace* namespace_i, Local<Object> result) {
    Local<Array> body = Nan::New<Array>();

    ConvertLinkedAstList(namespace_i->body, body);

    result->Set(Nan::New<String>("body").ToLocalChecked(), body);
    result->Set(Nan::New<String>("name").ToLocalChecked(), Nan::New<String>(namespace_i->name.value).ToLocalChecked());
}

void ConvertMemberExpression(btc_member_expression* expr, Local<Object> result) {
    Local<Object> left = Nan::New<Object>();

    Btc::ConvertAstItem(expr->left, left);
    
    result->Set(Nan::New<String>("left").ToLocalChecked(), left);
    result->Set(Nan::New<String>("right").ToLocalChecked(), Nan::New<String>(expr->right.value).ToLocalChecked());
}

void Btc::ConvertAstItem(btc_ast_item* item, Local<Object> result) {
    const char* type;

    switch(item->type) {
        case BTC_IMPORT_DECLARATION:
            type = Btc::Syntax::ImportDeclaration;
            ConvertImportDeclaration(item->import_declaration, result);
            break;
        case BTC_CONTAINER_GROUP:
            type = Btc::Syntax::ContainerGroup;
            ConvertContainerGroup(item->container_group, result);
            break;
        case BTC_CONTAINER_DECLARATION:
            type = Btc::Syntax::ContainerDeclaration;
            ConvertContainerDeclaration(item->container, result);
            break;
        case BTC_CONTAINER_PARAM:
            type = Btc::Syntax::ContainerParam;
            ConvertContainerParam(item->container_param, result);
            break;
        case BTC_IDENTIFIER:
            type = Btc::Syntax::Identifier;
            ConvertIdentifier(item->identifier, result);
            break;
        case BTC_TEMPLATE:
            type = Btc::Syntax::Template;
            ConvertTemplate(item->template_item, result);
            break;
        case BTC_STRING:
            type = Btc::Syntax::LiteralString;
            ConvertLiteralString(item->string, result);
            break;
        case BTC_NUMBER:
            type = Btc::Syntax::LiteralNumber;
            ConvertLiteralNumber(item->number, result);
            break;
        case BTC_NAMESPACE:
            type = Btc::Syntax::Namespace;
            ConvertNamespace(item->namespace_item, result);
            break;
        case BTC_MEMBER_EXPRESSION:
            type = Btc::Syntax::MemberExpression;
            ConvertMemberExpression(item->member_expression, result);
            break;
        case BTC_ALIAS:
            type = Btc::Syntax::Alias;
            ConvertTypeAlias(item->alias, result);
            break;
        default:
            type = NULL;
            Nan::ThrowError("Received invalid ast item type");
    }

    if(type != NULL) {
        result->Set(Nan::New<String>("type").ToLocalChecked(), Nan::New<String>(type).ToLocalChecked());
    }
}

NAN_METHOD(Ast::Parse) {
    btc_tokenizer* tokenizer;
    btc_tokenizer_init(&tokenizer);

    Local<String> jsText = Local<String>::Cast(info[0]);
    int length = jsText->Utf8Length();
    char* text = (char*)malloc(length*sizeof(char));
    jsText->WriteUtf8(text, length);
    text[length] = '\0';

    btc_tokenizer_scan(tokenizer, text);

    btc_parser* parser;
    btc_parser_init(&parser, tokenizer);
    int status = btc_parse(parser);

    if(status != BTC_OK) {
        Nan::ThrowError("failed to parse");
        return;
    }

    Local<Array> output = Array::New(Isolate::GetCurrent());

    ConvertLinkedAstList(parser->result, output);

    info.GetReturnValue().Set(output);

    btc_parser_destroy(parser);
    btc_tokenizer_destroy(tokenizer);
}

void Ast::Init(Local<Object> target) {
    Local<Function> parseFunction = Nan::GetFunction(Nan::New<FunctionTemplate>(Parse)).ToLocalChecked();
    Nan::Set(target, Nan::New<String>("parse").ToLocalChecked(), parseFunction);
}

NODE_MODULE(btcjs, Ast::Init);