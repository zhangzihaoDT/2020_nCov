# 2020_nCov专题页项目
本项目以时间轴形式介绍本次疫情的情况，可视化地理信息。

1. 第一阶段，爆发初期：对比非典来看（故事：因素（时间点、人口、政府行为）采取的行动（封城，口罩，医药物资））
2. 第二阶段，超越非典：全国性爆发（广东，温州，故事（医疗援助：））
3. 第三阶段，返工潮：大城市压力变大
4.总结
- 流行病学评估疫情（包含国际蔓延情况）
- 这场疫情中牺牲的人；反思公共医疗体系

项目计划和进度：[石墨文档](https://shimo.im/docs/293DVz7jmMiLFRk4/ 《2020_nCov专题页项目制作》，可复制链接后用石墨文档 App 或小程序打开) 

# 技术栈
采用典型单页面应用（SPA）形式呈现

- vue
- webpack
- d3
- vue-router
- sass

## 本地开发

### 配置

1. [安装 Node.js](https://nodejs.org/en/download/package-manager/)
2.

```sh
# clone the repo
git clone git@github.com:wuhan2020/map-viz.git

cd map-viz
# checkout react branch
git checkout react
# setup the npm env
npm install
# start the project
npm start
```

## 项目结构

```
├── .vscode/                  vscode editor related config
├── config/                   webpack configs, both dev and prod
├── scripts/                  bash scripts, basically all npm scripts will be invoking scripts stored here
├── src/                      main repo for all frontend code
    ├── common                common modules/shared codes
    ├── components            All UI related codes
        ├── Elements          All components/elements
        ├── Pages             All Pages
    ├── constants/            constants
├── test/                     testing code, hopefully we can get to them at some point :D
├── wwwroot/                  built/compiled files, dist files will be under here
    ├── dist/                 files under this directory is ready to deploy
├── package.json              npm package related
```

# 设计

## Ant Design

使用D3组件库进行开发，同时页面交互同步设计文档

## 设计文档

Please check out [this doc](https://www.figma.com/file/6oLZ4Swo2He0w8DUNELsUV/wuhan?node-id=268%3A28)

# 实现路线图

Before Backend is fully ready/supported:

- [ ] Display/Visualize data for
  - [ ] Clinics
  - [ ] Hotels
  - [ ] Donates
  - [ ] Logistics
  - [ ] Consultation
  - [ ] Production
- [ ] Page Sharing?
- [ ] Homepage
  - But we dont have that much data yet??

After Back is fully ready/supported
- [ ] Consider migrate to Rxjs - low priority
- [ ] Update all `GET` request for the above pages
- [ ] Support any `POST/DELETE` requests

