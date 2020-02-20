#include "node_ast.h"

#include <btc.h>
#include <nan.h>

using v8::String;
using v8::FunctionTemplate;
using v8::Function;
using v8::Array;
using v8::Number;

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
        const char* TemplateDeclaration = "TemplateDeclaration";
        const char* SingleLineComment = "SingleLineComment";
        const char* MultiLineComment = "MultiLineComment";
    }

    int Ok = BTC_OK;

    class Parser {
    public:
        Parser() {
            btc_tokenizer_init(&tokenizer);
        }
        ~Parser() {
            btc_parser_destroy(parser);
            btc_tokenizer_destroy(tokenizer);
        }
        btc_ast_list* GetResult() {
            return parser->result;
        }
        void Parse(const char* text) {
            status = btc_tokenizer_scan(tokenizer, text);
            BTC_CHECK_STATUS_VOID(status);

            btc_parser_init(&parser, tokenizer);

            status = btc_parse(parser);
            BTC_CHECK_STATUS_VOID(status);
        }
        void PrintFailure() {
            btc_token* token = btc_tokens_list_get(parser->tokens_list, parser->current_token == 0 ? 0 : parser->current_token - 1);
            fprintf(stderr, "failure at token \"%s\" (line = %lu)\n", token->allocated, token->range.start_line_number);
        }
        bool Failed() {
            return status != Ok;
        }
    private:
        int status;
        btc_parser* parser;
        btc_tokenizer* tokenizer;
    };

    void ConvertAstItem(btc_ast_item*, Local<Object>);
}

void ConvertTypeAlias(btc_alias alias, Local<Object> result) {
    Local<Object> value = Nan::New<Object>();

    result->Set(Nan::New<String>("value").ToLocalChecked(), value);
    result->Set(Nan::New<String>("name").ToLocalChecked(), Nan::New<String>(alias.name.value).ToLocalChecked());
    Btc::ConvertAstItem(alias.value, value);
}

void ConvertLinkedAstList(btc_ast_list* list, Local<Array> output) {
    btc_ast_item* node = nullptr;
    Local<Object> item;
    vector_foreach(list, i) {
        node = btc_ast_list_get(list, i);
        item = Nan::New<Object>();
        Btc::ConvertAstItem(node, item);
        output->Set(Nan::New<Number>(output->Length()), item);
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

    if(item->default_value != nullptr) {
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

void ConvertTemplateDeclaration(btc_template_declaration* item, Local<Object> result) {
    Local<Array> arguments = Nan::New<Array>();
    ConvertLinkedAstList(item->arguments, arguments);

    Local<Object> body = Nan::New<Object>();
    Btc::ConvertAstItem(item->body, body);

    result->Set(Nan::New<String>("arguments").ToLocalChecked(), arguments);
    result->Set(Nan::New<String>("body").ToLocalChecked(), body);
}

void CopyCommentsList(btc_comments_list* list, Local<Array> out) {
    btc_comment* comment = nullptr;
    Local<String> comment_type;
    vector_foreach(list, i) {
        comment = btc_comments_list_get(list, i);
        if(comment->token_type == BTC_TOKEN_MULTI_LINE_COMMENT) {
            comment_type = Nan::New<String>(Btc::Syntax::MultiLineComment).ToLocalChecked();
        } else if(comment->token_type == BTC_TOKEN_SINGLE_LINE_COMMENT) {
            comment_type = Nan::New<String>(Btc::Syntax::SingleLineComment).ToLocalChecked();
        } else {
            char error[128];
            sprintf(error, "Unhandled ast item: %d\n", comment->token_type);
            fprintf(stderr, "%s", error);
            Nan::ThrowError(error);
            break;
        }
        Local<Object> object = Nan::New<Object>();
        object->Set(Nan::New<String>("type").ToLocalChecked(), comment_type);
        object->Set(Nan::New<String>("value").ToLocalChecked(), Nan::New<String>(comment->value).ToLocalChecked());
        out->Set(i, object);
    }
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
        case BTC_TEMPLATE_DECLARATION:
            type = Btc::Syntax::TemplateDeclaration;
            ConvertTemplateDeclaration(item->template_declaration, result);
            break;
        default:
            type = NULL;
            fprintf(stderr, "invalid ast item = %d (line number = %zu)\n", item->type, item->range.start_line_number);
            Nan::ThrowError("Received invalid ast item type");
    }

    if(type != NULL) {
        Local<Array> leadingComments = Nan::New<Array>();
        Local<Array> trailingComments = Nan::New<Array>();
        CopyCommentsList(item->leading_comments, leadingComments);
        CopyCommentsList(item->trailing_comments, trailingComments);
        result->Set(Nan::New<String>("leadingComments").ToLocalChecked(), leadingComments);
        result->Set(Nan::New<String>("trailingComments").ToLocalChecked(), trailingComments);
        result->Set(Nan::New<String>("type").ToLocalChecked(), Nan::New<String>(type).ToLocalChecked());
    }
}

NAN_METHOD(Ast::Parse) {
    Nan::HandleScope scope;
    Btc::Parser* parser = new Btc::Parser();

    Nan::Utf8String string(Nan::To<String>(info[0]).ToLocalChecked());
    parser->Parse(*string);

    if(parser->Failed()) {
        parser->PrintFailure();
        Nan::ThrowError("Failed to parse");
        return;
    }

    Local<Array> output = Nan::New<Array>();
    ConvertLinkedAstList(parser->GetResult(), output);

    delete parser;
    info.GetReturnValue().Set(output);
}

void Ast::Init(Local<Object> target) {
    Local<Function> parseFunction = Nan::GetFunction(Nan::New<FunctionTemplate>(Parse)).ToLocalChecked();
    Nan::Set(target, Nan::New<String>("parse").ToLocalChecked(), parseFunction);
}

NODE_MODULE(btcjs, Ast::Init);