"use strict";(self.webpackChunkdocumentation=self.webpackChunkdocumentation||[]).push([[761],{3905:function(e,t,r){r.d(t,{Zo:function(){return u},kt:function(){return d}});var n=r(7294);function o(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function s(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?s(Object(r),!0).forEach((function(t){o(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):s(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function a(e,t){if(null==e)return{};var r,n,o=function(e,t){if(null==e)return{};var r,n,o={},s=Object.keys(e);for(n=0;n<s.length;n++)r=s[n],t.indexOf(r)>=0||(o[r]=e[r]);return o}(e,t);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(n=0;n<s.length;n++)r=s[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}var c=n.createContext({}),l=function(e){var t=n.useContext(c),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},u=function(e){var t=l(e.components);return n.createElement(c.Provider,{value:t},e.children)},p={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},m=n.forwardRef((function(e,t){var r=e.components,o=e.mdxType,s=e.originalType,c=e.parentName,u=a(e,["components","mdxType","originalType","parentName"]),m=l(r),d=o,f=m["".concat(c,".").concat(d)]||m[d]||p[d]||s;return r?n.createElement(f,i(i({ref:t},u),{},{components:r})):n.createElement(f,i({ref:t},u))}));function d(e,t){var r=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var s=r.length,i=new Array(s);i[0]=m;var a={};for(var c in t)hasOwnProperty.call(t,c)&&(a[c]=t[c]);a.originalType=e,a.mdxType="string"==typeof e?e:o,i[1]=a;for(var l=2;l<s;l++)i[l]=r[l];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}m.displayName="MDXCreateElement"},5057:function(e,t,r){r.r(t),r.d(t,{frontMatter:function(){return a},contentTitle:function(){return c},metadata:function(){return l},toc:function(){return u},default:function(){return m}});var n=r(7462),o=r(3366),s=(r(7294),r(3905)),i=["components"],a={sidebar_position:1,sidebar_label:"Quickstart"},c="Overview",l={unversionedId:"access-control-module/overview",id:"access-control-module/overview",isDocsHomePage:!1,title:"Overview",description:"nestjs-prisma-crud comes with optional utilities to help you with common access control use cases. You may find it useful if:",source:"@site/docs/access-control-module/overview.md",sourceDirName:"access-control-module",slug:"/access-control-module/overview",permalink:"/nestjs-prisma-crud/access-control-module/overview",editUrl:"https://github.com/kepelrs/nestjs-prisma-crud/edit/master/docs/docs/access-control-module/overview.md",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1,sidebar_label:"Quickstart"},sidebar:"tutorialSidebar",previous:{title:"CRUD Endpoints",permalink:"/nestjs-prisma-crud/crud-endpoints"},next:{title:"Module Registration",permalink:"/nestjs-prisma-crud/access-control-module/access-control-module"}},u=[{value:"Quickstart",id:"quickstart",children:[]}],p={toc:u};function m(e){var t=e.components,r=(0,o.Z)(e,i);return(0,s.kt)("wrapper",(0,n.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,s.kt)("h1",{id:"overview"},"Overview"),(0,s.kt)("p",null,(0,s.kt)("inlineCode",{parentName:"p"},"nestjs-prisma-crud")," comes with optional utilities to help you with common access control use cases. You may find it useful if:"),(0,s.kt)("ul",null,(0,s.kt)("li",{parentName:"ul"},"You want to restrict certain endpoints to be accessible only by users with certain roles ",(0,s.kt)("br",null)," ",(0,s.kt)("em",{parentName:"li"},'eg. a "/report" endpoint that is only available for admin users')),(0,s.kt)("li",{parentName:"ul"},"You want to grant scoped access based on some user attributes ",(0,s.kt)("br",null),(0,s.kt)("em",{parentName:"li"},'eg. a "/messages" endpoint that must respond only with the messages owned by the requesting user')),(0,s.kt)("li",{parentName:"ul"},"You want to write your own more complex ",(0,s.kt)("a",{parentName:"li",href:"./custom-policy"},"custom policies"),", without breaking or re-implementing pagination/sorting/filtering.")),(0,s.kt)("h2",{id:"quickstart"},"Quickstart"),(0,s.kt)("p",null,"To start using the access control utilities you must first register the ",(0,s.kt)("inlineCode",{parentName:"p"},".accessControl")," settings in your ",(0,s.kt)("inlineCode",{parentName:"p"},"PrismaCrudModule")," registration:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-ts",metastring:"title=app.module.ts {7-11}",title:"app.module.ts","{7-11}":!0},"import { PrismaCrudModule } from 'nestjs-prisma-crud';\n\n@Module({\n    imports: [\n        PrismaCrudModule.register({\n            prismaService: PrismaService,\n            accessControl: {\n                authDataKey: 'user',\n                getRolesFromAuthDataFn: (authenticatedUser) => authenticatedUser?.roles,\n                strictMode: false,\n            },\n        }),\n    ],\n    // ...\n})\nexport class AppModule {}\n")),(0,s.kt)("p",null,"Then add the ",(0,s.kt)("inlineCode",{parentName:"p"},"@AccessPolicy()")," decorator to your controllers like so:"),(0,s.kt)("pre",null,(0,s.kt)("code",{parentName:"pre",className:"language-ts",metastring:"title=post.controller.ts {5}",title:"post.controller.ts","{5}":!0},"@Controller('post')\nexport class PostController {\n    // ...\n    @Get()\n    @AccessPolicy('everyone')\n    async getPosts(@Query('crudQuery') crudQuery: string) {\n        const match = await this.postsService.findMany(crudQuery);\n        return match;\n    }\n}\n")),(0,s.kt)("p",null,"See the next sessions for more details on the ",(0,s.kt)("a",{parentName:"p",href:"./access-control-module"},"AccessControlModule")," and ",(0,s.kt)("a",{parentName:"p",href:"./access-policy"},"AccessPolicy")," configuration."))}m.isMDXComponent=!0}}]);