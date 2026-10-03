window.EDITORIAL_SUPABASE = {
  url: "https://jzqxfhlowlllkiqvuqtd.supabase.co",
  key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cXhmaGxvd2xsbGtpcXZ1cXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5Njg3NDgsImV4cCI6MjEwNjU0NDc0OH0._SjV_jJYDml4d1SoPOpUBzFPFkWYkmO-aIuImvn9vRU"
};

/* Editorial OS V12.17 · recovery runtime starts before third-party vendors. */
(()=>{
  try{
    if(!document.querySelector('script[data-editorial-v1217-recovery]')){
      const s=document.createElement('script');
      s.src='./js/v1217-recovery.js?v=12.17';
      s.async=true;
      s.dataset.editorialV1217Recovery='1';
      document.head.appendChild(s);
    }
  }catch(e){console.info('Recovery runtime no disponible',e)}
})();

/* Safe-boot watchdog. If a third-party script blocks normal startup, redirect to
   launch.html, which boots the same app without letting external dependencies
   freeze the interface. */
(()=>{
  try{
    const params=new URLSearchParams(location.search);
    if(params.get('boot')==='12.17'||/\/launch\.html$/.test(location.pathname))return;
    const timer=setTimeout(()=>{
      if(window.EDITORIAL_V123_API)return;
      const next=new URL('./launch.html',location.href);
      next.searchParams.set('recover','watchdog');
      next.searchParams.set('v','12.17');
      location.replace(next.href);
    },4200);
    window.addEventListener('editorial:boot-ready',()=>clearTimeout(timer),{once:true});
  }catch(e){console.info('Safe boot watchdog no disponible',e)}
})();
