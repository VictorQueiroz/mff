{
    "targets": [{
        "target_name": "libbtc",
        "sources": [
            "src/ast/ast_item.c",
            "src/ast/ast_list.c",
            "src/ast/comments_list.c",
            "src/ast/container_declaration.c",
            "src/ast/container_group.c",
            "src/ast/container_param.c",
            "src/ast/containers_list.c",
            "src/ast/member_expression.c",
            "src/ast/namespace.c",
            "src/ast/template.c",
            "src/character.c",
            "src/parser.c",
            "src/token.c",
            "src/tokenizer.c",
            "src/tokens_list.c"
        ],
        "include_dirs": [
            "src",
            "include"
        ],
        "type": "static_library",
        "direct_dependent_settings": {
            "include_dirs": ["include"]
        }
    }]
}