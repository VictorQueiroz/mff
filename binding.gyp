{
    "targets": [{
        "target_name": "btcjs",
        "include_dirs": [
            "<!(node -e \"require('nan')\")"
        ],
        "dependencies": [
            "deps/btc/libbtc.gyp:libbtc"
        ],
        "sources": [
            "src/node_ast.cc"
        ]
    }]
}