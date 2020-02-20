project(btc)
cmake_minimum_required(VERSION 3.0)

set(CMAKE_C_STANDARD 11)
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_POSITION_INDEPENDENT_CODE ON)

add_subdirectory(deps/btc)

add_library(btcjs SHARED src/node_ast.cc)
target_include_directories(btcjs PRIVATE src deps/btc/src node_modules/nan $ENV{NODE_PATH}/include/node)
target_compile_options(btcjs PRIVATE -fPIC)
target_link_libraries(btcjs PRIVATE ${CMAKE_JS_LIB} btc)

if(DEFINED CMAKE_JS_VERSION)
    include_directories(${CMAKE_JS_INC})
    set_target_properties(btcjs PROPERTIES PREFIX "" SUFFIX ".node")
endif()