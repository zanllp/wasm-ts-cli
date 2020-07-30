
export const initTsFile = `
import Module, { modType } from './main';
const fetchModule = Module;
let m: modType;

Promise.resolve().then(async () => {
    m = await fetchModule();

    const result = m.ccall('add_one', // name of C function
        'number', // return type
        ['number'], // argument types
        [10]);
    console.log(\`10 + 1 resuelt:\${result}\`);
    console.log('lerp result: ' + m.lerp(1, 2, 0.5));
});
`;

export const initTsDeclearFile = `
import 'emscripten';
export type modType = EmscriptenModule & {
    cwrap: typeof cwrap,
    ccall: typeof ccall,
    lerp: (a:number,b:number,c:number)=>number,
};
declare const Module : () => Promise<modType>;
export default Module;
`;

export const initCppFile = `
#include <iostream>
#include <emscripten/bind.h>

#include <emscripten.h>
using namespace std;
using namespace emscripten;

float lerp(float a, float b, float t)
{
    return (1 - t) * a + t * b;
}


EMSCRIPTEN_BINDINGS(my_module)
{
    emscripten::function("lerp", &lerp);
}

extern "C"
{

    int add_one(int a)
    {
        return a + 1;
    }
}
`;

export const buildCppFile = `
module.exports = {
    main: 'src/main.cpp',
    std: 'c++17',
    allowMemoryGroth: 1,
    exportedFunctions: ['add_one'],
    extraExportedRuntimeMethods: ['cwrap', 'ccall'],
    target: 'src/main.js',
    optimizationLevel: 'o3'
}
`;



export interface ICompilerConfig {
    main: string;
    std: 'c++11' | 'c++14' | 'c++2a' | 'c++17' | 'gnu++11' | 'gnu++14' | 'gnu++17' | 'gnu++2a';
    allowMemoryGroth?: 1;
    exportedFunctions: Array<string>;
    extraExportedRuntimeMethods: Array<string>;
    target: string;
    optimizationLevel: 'o1' | 'o2' | 'o3';
}

export const initConfig: ICompilerConfig = {
    main: 'src/main.cpp',
    std: 'c++17',
    allowMemoryGroth: 1,
    exportedFunctions: ['add_one'],
    extraExportedRuntimeMethods: ['cwrap', 'ccall'],
    target: 'src/main.js',
    optimizationLevel: 'o3'
};

export const createCompilerCommand = (config: ICompilerConfig) => {
    return `
    cd emsdk
    . ./emsdk_env.sh
    cd ../
    em++ -${config.optimizationLevel} ${config.main} \\
    --bind \\
    -std=${config.std} \\
    -s MODULARIZE \\
    ${config.allowMemoryGroth ? `-s ALLOW_MEMORY_GROWTH=${config.allowMemoryGroth} \\` : ''}
    -s EXPORTED_FUNCTIONS='[${config.exportedFunctions.map(fn => `"_${fn}"`).join(',')}]' \\
    -s EXTRA_EXPORTED_RUNTIME_METHODS='[${config.extraExportedRuntimeMethods.map(fn => `"${fn}"`).join(',')}]' \\
    -o ${config.target}
    echo "编译完成"
    `;
};

export const packageJson = (name: string) => JSON.stringify(
    {
        name,
        version: '1.0.0',
        main: 'index.js',
        license: 'MIT',
        devDependencies: {},
        scripts: {
            start: 'yarn build-cpp && yarn start-ts',
            'start-ts': 'ts-node src/index.ts',
            'build-cpp': 'chmod 777 build-cpp.sh && ./build-cpp.sh',
        },
        dependencies: {},
    },
    null,
    4
);

export const changePackageJson = (src: string) => {
    const obj = JSON.parse(src);
    obj.scripts = {
        'wasm-start': 'yarn wasm-build-cpp && yarn wasm-start-ts',
        'wasm-start-ts': 'ts-node src/wasm-index.ts',
        'wasm-build-cpp': 'chmod 777 build-cpp.sh && ./build-cpp.sh',
        ...obj.scripts
    };
    return JSON.stringify(obj, null, 4);
};