(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[152],{68781:(e,t,a)=>{Promise.resolve().then(a.bind(a,18834))},54267:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(23803).Z)("Clipboard",[["rect",{width:"8",height:"4",x:"8",y:"2",rx:"1",ry:"1",key:"tgr4d6"}],["path",{d:"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2",key:"116196"}]])},26444:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(23803).Z)("Facebook",[["path",{d:"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",key:"1jg4f8"}]])},42312:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(23803).Z)("Linkedin",[["path",{d:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z",key:"c2jq9f"}],["rect",{width:"4",height:"12",x:"2",y:"9",key:"mk3on5"}],["circle",{cx:"4",cy:"4",r:"2",key:"bt5ra8"}]])},92177:(e,t,a)=>{"use strict";a.d(t,{Z:()=>r});let r=(0,a(23803).Z)("Twitter",[["path",{d:"M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",key:"pff0z6"}]])},18834:(e,t,a)=>{"use strict";a.d(t,{BlogLayout:()=>d});var r=a(27573),i=a(13628),s=a(58998),n=a(48935),l=a(5754);function d(e){let{children:t}=e;return(0,r.jsx)(l.E.div,{className:"container max-w-screen-xl py-16",initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.5},children:(0,r.jsxs)("div",{className:"grid grid-cols-[3fr_1fr] gap-16",children:[(0,r.jsxs)("section",{className:"space-y-4 w-auto overflow-hidden border border-border rounded-lg p-16 bg-gradient-to-br from-background to-muted/20",children:[(0,r.jsx)(n.BackButton,{}),(0,r.jsx)("div",{className:"max-w-full markdown-content",children:t}),(0,r.jsx)(i.CTASection,{})]}),(0,r.jsx)("aside",{className:"relative",children:(0,r.jsx)(s.o5,{})})]})})}},48935:(e,t,a)=>{"use strict";a.d(t,{BackButton:()=>m,Page:()=>x,PageDescription:()=>f,PageHeader:()=>p,PageTitle:()=>h});var r=a(27573),i=a(33495),s=a(5754),n=a(87659),l=a(7653),d=a(23005);let o={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.1}}},c={hidden:{opacity:0,y:20},visible:{opacity:1,y:0,transition:{type:"spring",stiffness:100}}},m=l.forwardRef((e,t)=>{let{href:a="/",className:s,...l}=e;return(0,r.jsx)(n.default,{href:a,passHref:!0,children:(0,r.jsxs)(d.z,{ref:t,variant:"ghost",size:"icon",className:(0,i.cn)("absolute -top-12 sm:-top-16 left-0 rounded-full bg-secondary hover:bg-secondary/80 transition-transform hover:scale-105 active:scale-95",s),...l,children:[(0,r.jsxs)("svg",{xmlns:"http://www.w3.org/2000/svg",width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[(0,r.jsx)("path",{d:"m12 19-7-7 7-7"}),(0,r.jsx)("path",{d:"M19 12H5"})]}),(0,r.jsx)("span",{className:"sr-only",children:"Back"})]})})});m.displayName="BackButton";let h=l.forwardRef((e,t)=>{let{className:a,children:n,...l}=e;return(0,r.jsx)(s.E.h1,{ref:t,variants:c,initial:"hidden",animate:"visible",className:(0,i.cn)("text-3xl sm:text-4xl md:text-5xl font-bold mb-2 md:mb-4 leading-normal md:max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground",a),...l,children:n})});h.displayName="PageTitle";let f=l.forwardRef((e,t)=>{let{className:a,children:n,...l}=e;return(0,r.jsx)(s.E.p,{ref:t,variants:c,initial:"hidden",animate:"visible",className:(0,i.cn)("text-lg sm:text-xl mb-8 sm:mb-10 md:mb-12 text-muted-foreground",a),...l,children:n})});f.displayName="PageDescription";let p=l.forwardRef((e,t)=>{let{className:a,children:s,...n}=e;return(0,r.jsx)("div",{className:(0,i.cn)("text-left mb-6 sm:mb-8 relative",a),...n,children:s})});p.displayName="PageHeader",l.forwardRef((e,t)=>{let{className:a,children:n,...l}=e;return(0,r.jsx)(s.E.div,{ref:t,initial:{opacity:0,scale:.95},animate:{opacity:1,scale:1},transition:{duration:.5},className:(0,i.cn)("w-full h-[300px] sm:h-[400px] rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden",a),...l,children:n})}).displayName="PageCover";let x=l.forwardRef((e,t)=>{let{className:a,children:n,...l}=e;return(0,r.jsx)(s.E.main,{ref:t,variants:o,initial:"hidden",animate:"visible",className:(0,i.cn)("px-8 py-16 sm:py-12 md:py-16",a),...l,children:n})});x.displayName="Page",l.forwardRef((e,t)=>{let{className:a,children:n,...l}=e;return(0,r.jsx)(s.E.div,{ref:t,className:(0,i.cn)("flex-1",a),...l,children:n})}).displayName="PageContent"}},e=>{var t=t=>e(e.s=t);e.O(0,[124,74,469,536,754,216,931,9,230,998,174,765,744],()=>t(68781)),_N_E=e.O()}]);