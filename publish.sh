echo '改版本号了吗?'
yarn build
npm set registry https://registry.npmjs.org/ 
npm login
npm publish
npm set registry https://registry.npm.taobao.org/
yarn clean