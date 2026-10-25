import {animate} from 'motion';
import {createIcons, LayoutDashboard, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, CalendarDays, ShieldCheck, CircleHelp, Upload, RefreshCw, Moon, Sun, ChevronRight, Search, Wallet, ChartNoAxesCombined, CircleCheck, CircleAlert, X, FileSpreadsheet, Activity, Bell, Check, Coins} from 'lucide';
const icons={LayoutDashboard,ArrowDownLeft,ArrowUpRight,ArrowLeftRight,CalendarDays,ShieldCheck,CircleHelp,Upload,RefreshCw,Moon,Sun,ChevronRight,Search,Wallet,ChartNoAxesCombined,CircleCheck,CircleAlert,X,FileSpreadsheet,Activity,Bell,Check,Coins};
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
window.FinanceUI={
 icons:()=>createIcons({icons,attrs:{'stroke-width':1.7,'aria-hidden':'true'}}),
 reveal:(target)=>{if(!reduced())animate(target,{opacity:[0,1],transform:['translateY(8px)','translateY(0px)']},{duration:.32,ease:[.2,.8,.2,1]});},
 chart:()=>{if(!reduced())animate('.bar',{transform:['scaleY(0)','scaleY(1)']},{duration:.48,ease:[.2,.8,.2,1]});},
 detail:()=>{if(!reduced())animate('#detail',{opacity:[0,1],transform:['translateX(30px)','translateX(0)']},{duration:.24,ease:[.2,.8,.2,1]});},
 change:()=>{if(!reduced())animate('.day-card strong',{opacity:[.35,1],transform:['translateY(4px)','translateY(0)']},{duration:.25});}
};
