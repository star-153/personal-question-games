// app.js — logique commune
window.App = (function(){
  const LOCAL_KEY = 'questions';
  // defaultQuestions duplicated for safety if fetch fails
  const defaultQuestions = [
    {
      "id": "q1",
      "type": "text",
      "label": "Ton nom",
      "placeholder": "Ex. Marie Dupont",
      "required": false
    },
    {
      "id": "q2",
      "type": "radio",
      "label": "As‑tu aimé l'événement ?",
      "options": ["Oui", "Non", "Un peu"],
      "required": true
    },
    {
      "id": "q3",
      "type": "textarea",
      "label": "Commentaires (facultatif)",
      "placeholder": "Ton avis",
      "required": false
    }
  ];

  async function loadQuestions(forceDefault = false){
    if(!forceDefault){
      try{
        const local = localStorage.getItem(LOCAL_KEY);
        if(local){
          return JSON.parse(local);
        }
      }catch(e){ console.warn('local load fail', e); }
    }
    // try fetch from data/questions.json
    try{
      const r = await fetch('data/questions.json', {cache: 'no-store'});
      if(r.ok){
        const json = await r.json();
        return json;
      }
    }catch(e){
      console.warn('fetch questions failed', e);
    }
    return defaultQuestions;
  }

  function saveQuestionsLocal(qArray){
    try{
      localStorage.setItem(LOCAL_KEY, JSON.stringify(qArray));
    }catch(e){
      console.error('save failed', e);
    }
  }

  function renderQuestionnaire(containerId, questions){
    const c = document.getElementById(containerId);
    c.innerHTML = '';
    questions.forEach(q => {
      const wrapper = document.createElement('div');
      wrapper.className = 'question';
      const label = document.createElement('label');
      label.innerHTML = `<strong>${q.label}</strong>` + (q.required ? ' <span style="color:#c00">*</span>' : '');
      wrapper.appendChild(label);

      if(q.type === 'text'){
        const inp = document.createElement('input');
        inp.type = 'text';
        inp.id = q.id;
        inp.placeholder = q.placeholder || '';
        inp.required = !!q.required;
        inp.style.width = '100%';
        inp.style.padding = '8px';
        inp.style.marginTop = '8px';
        wrapper.appendChild(inp);
      } else if(q.type === 'textarea'){
        const ta = document.createElement('textarea');
        ta.id = q.id;
        ta.placeholder = q.placeholder || '';
        ta.rows = 4;
        ta.style.width = '100%';
        ta.style.marginTop = '8px';
        wrapper.appendChild(ta);
      } else if(q.type === 'radio'){
        const opts = q.options || [];
        const div = document.createElement('div');
        opts.forEach((opt, i) => {
          const id = `${q.id}_${i}`;
          const html = `<div style="margin-top:6px;"><label><input type="radio" name="${q.id}" value="${opt}" /> ${opt}</label></div>`;
          div.insertAdjacentHTML('beforeend', html);
        });
        wrapper.appendChild(div);
      } else if(q.type === 'checkbox'){
        const opts = q.options || [];
        const div = document.createElement('div');
        opts.forEach((opt, i) => {
          const html = `<div style="margin-top:6px;"><label><input type="checkbox" name="${q.id}" value="${opt}" /> ${opt}</label></div>`;
          div.insertAdjacentHTML('beforeend', html);
        });
        wrapper.appendChild(div);
      } else {
        wrapper.appendChild(document.createTextNode('Type de question inconnu: ' + q.type));
      }

      c.appendChild(wrapper);
    });
  }

  function collectAnswers(containerId){
    const answers = {};
    const all = document.querySelectorAll('#' + containerId + ' .question, #' + containerId + ' [id]');
    // use questions from DOM by reading inputs/radios
    document.querySelectorAll('#' + containerId + ' input, #' + containerId + ' textarea').forEach(el => {
      if(el.type === 'radio'){
        if(el.checked){
          answers[el.name] = el.value;
        }
      } else if(el.type === 'checkbox'){
        if(!answers[el.name]) answers[el.name] = [];
        if(el.checked) answers[el.name].push(el.value);
      } else if(el.id){
        answers[el.id] = el.value || '';
      }
    });
    return answers;
  }

  return {
    loadQuestions,
    saveQuestionsLocal,
    renderQuestionnaire,
    collectAnswers
  };
})();
