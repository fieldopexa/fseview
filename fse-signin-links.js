/* FSE View: sign-in gateways for Messages and New Visit.
 * No credential fields, tokens, or write APIs are placed on the public viewer.
 * Authentication always occurs in the full FSM on the same official account. */
(function(){
  'use strict';
  const APP_URL='https://fieldopexa.github.io/io/';
  const PATHS={messages:'messages',newvisit:'newvisit'};
  const ICONS={
    messages:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11.3a7.8 7.8 0 0 1-8 7.5 9.3 9.3 0 0 1-3.2-.6L4 20l1.2-4A7.5 7.5 0 0 1 4 11.3C4 7.3 7.6 4 12 4s8 3.3 8 7.3Z"/><path d="M8.7 11.3h.1m3.2 0h.1m3.2 0h.1"/></svg>',
    newvisit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
  };
  function hrefFor(intent){
    const url=new URL(APP_URL);
    url.searchParams.set('intent',intent);
    return url.href;
  }
  function iconButton(intent,mobile){
    const btn=document.createElement('button');
    btn.type='button';
    btn.className=mobile?'fse-signin-mobile':'fse-signin-nav';
    btn.dataset.fseSignin=intent;
    const label=intent==='messages'?'Messages':'New Visit';
    btn.setAttribute('aria-label',label+' (sign in required)');
    btn.innerHTML='<span class="fse-signin-icon">'+ICONS[intent]+'</span><span>'+label+'</span><span class="fse-signin-lock" aria-hidden="true">↗</span>';
    btn.addEventListener('click',()=>openPrompt(intent));
    return btn;
  }
  let dialog,lastTrigger;
  function openPrompt(intent){
    if(!Object.hasOwn(PATHS,intent))return;
    if(!dialog)makeDialog();
    lastTrigger=document.activeElement;
    const title=dialog.querySelector('[data-signin-title]');
    const message=dialog.querySelector('[data-signin-copy]');
    const action=dialog.querySelector('[data-signin-action]');
    const feature=intent==='messages'?'Messages':'New Visit';
    title.textContent='Sign in to '+feature;
    message.textContent=intent==='messages'
      ?'Use your FSE account to open FSE Team, direct messages, and Saved Messages in the main FSM.'
      :'Use your FSE account to log a new field visit in the main FSM.';
    action.href=hrefFor(intent);
    dialog.hidden=false;
    dialog.querySelector('[data-signin-cancel]').focus();
  }
  function closePrompt(){
    if(!dialog)return;
    dialog.hidden=true;
    lastTrigger?.focus?.();
  }
  function makeDialog(){
    dialog=document.createElement('div');
    dialog.className='fse-signin-overlay';
    dialog.hidden=true;
    dialog.setAttribute('role','presentation');
    dialog.innerHTML='<section class="fse-signin-dialog" role="dialog" aria-modal="true" aria-labelledby="fse-signin-title">'
      +'<button type="button" class="fse-signin-dismiss" data-signin-cancel aria-label="Close dialog">×</button>'
      +'<span class="fse-signin-kicker">FSE ACCOUNT REQUIRED</span>'
      +'<h2 id="fse-signin-title" data-signin-title>Sign in</h2>'
      +'<p data-signin-copy></p>'
      +'<div class="fse-signin-actions"><button type="button" class="fse-signin-secondary" data-signin-cancel>Not now</button>'
      +'<a class="fse-signin-primary" data-signin-action rel="noopener noreferrer" href="'+hrefFor('messages')+'">Continue to FSM sign in</a></div>'
      +'</section>';
    document.body.append(dialog);
    dialog.querySelectorAll('[data-signin-cancel]').forEach(el=>el.addEventListener('click',closePrompt));
    dialog.addEventListener('click',e=>{if(e.target===dialog)closePrompt();});
    dialog.addEventListener('keydown',e=>{
      if(e.key==='Escape'){e.preventDefault();closePrompt();}
      if(e.key==='Tab'){
        const focusable=[...dialog.querySelectorAll('button,a[href]')].filter(el=>!el.hidden);
        const first=focusable[0],last=focusable[focusable.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    });
  }
  function init(){
    // Preserve every existing public-viewer tab and read-only restriction.
    const nav=document.querySelector('.app-nav');
    if(nav&&!nav.querySelector('[data-fse-signin]')){
      const section=document.createElement('div');
      section.className='fse-signin-section';
      section.innerHTML='<div class="nav-section-label">FSE ACCESS</div>';
      section.append(iconButton('newvisit',false),iconButton('messages',false));
      nav.insertBefore(section,nav.firstElementChild);
    }
    const mobileNav=document.querySelector('.mobile-drawer-nav');
    if(mobileNav&&!mobileNav.querySelector('[data-fse-signin]')){
      const section=document.createElement('div');section.className='fse-signin-mobile-section';
      section.innerHTML='<span class="fse-signin-mobile-caption">FSE ACCESS</span>';
      section.append(iconButton('newvisit',true),iconButton('messages',true));
      mobileNav.insertBefore(section,mobileNav.firstElementChild);
    }
    // The old New Visit nav is hidden by view-only policy. No unauthenticated
    // visitor can access the editing panel; our sign-in gateways are separate.
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();