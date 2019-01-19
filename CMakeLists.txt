project(btc)
cmake_minimum_required(VERSION 3.0)

set(CMAKE_CXX_STANDARD 11)
add_subdirectory(deps/btc)

add_library(btcjs SHARED src/node_ast.cc)
target_include_directories(btcjs PRIVATE src deps/btc/src)

target_compile_options(btc PRIVATE -fPIC)

if(CMAKE_JS_VERSION)
    include_directories(${CMAKE_JS_INC})
    set_target_properties(btcjs PROPERTIES PREFIX "" SUFFIX ".node")
    target_link_libraries(btcjs PRIVATE ${CMAKE_JS_LIB} btc)
else()
    target_link_libraries(btcjs PRIVATE btc)
    target_include_directories(btcjs PRIVATE node_modules/nan $ENV{NODE_PATH}/../include/node)
endif()