// ============================================
// PROFILE
// ============================================
async function loadProfile() {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
    .single();

  if (!data) return;

  document.getElementById('p-name').value = data.full_name || '';
  document.getElementById('p-title').value = data.title || '';
  document.getElementById('p-email').value = data.email || '';
  document.getElementById('p-phone').value = data.phone || '';
  document.getElementById('p-location').value = data.location || '';
  document.getElementById('p-bio').value = data.bio || '';
  document.getElementById('p-resume').value = data.resume_url || '';
  document.getElementById('p-github').value = data.github_username || '';
  document.getElementById('p-whatsapp').value = data.whatsapp_number || '';
  document.getElementById('p-company').value = data.company_name || '';
  document.getElementById('p-company-start').value = data.company_start_date || '';
  document.getElementById('p-company-url').value = data.company_url || '';

  if (data.photo_url) {
    document.getElementById('profile-avatar').src = data.photo_url;
  }
}

function setupProfileForm() {
  const form        = document.getElementById('profile-form');
  const avatarInput = document.getElementById('avatar-input');
  const resumeInput = document.getElementById('resume-file-input');
  const resumeUrlEl = document.getElementById('p-resume');
  const resumeStatus = document.getElementById('resume-file-status');

  avatarInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        document.getElementById('profile-avatar').src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Upload do PDF de currículo imediatamente ao selecionar
  resumeInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    resumeStatus.textContent = 'Fazendo upload...';
    resumeStatus.style.color = 'var(--text-secondary)';

    try {
      const url = await uploadFile('resumes', file);
      resumeUrlEl.value = url;
      resumeStatus.textContent = 'Upload concluído! Salve o perfil para confirmar.';
      resumeStatus.style.color = 'var(--accent)';
    } catch (err) {
      resumeStatus.textContent = 'Erro ao fazer upload: ' + err.message;
      resumeStatus.style.color = '#f85149';
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = window.currentUserId;
    if (!userId) return;

    let photoUrl = null;
    const avatarFile = avatarInput.files[0];
    if (avatarFile) {
      try {
        photoUrl = await uploadFile('avatars', avatarFile);
      } catch (err) {
        showToast('Erro ao fazer upload da foto', true);
        return;
      }
    }

    const profileData = {
      user_id: userId,
      full_name: document.getElementById('p-name').value.trim(),
      title: document.getElementById('p-title').value.trim(),
      email: document.getElementById('p-email').value.trim(),
      phone: document.getElementById('p-phone').value.trim(),
      location: document.getElementById('p-location').value.trim(),
      bio: document.getElementById('p-bio').value.trim(),
      resume_url: resumeUrlEl.value.trim() || null,
      github_username: document.getElementById('p-github').value.trim() || null,
      whatsapp_number: document.getElementById('p-whatsapp').value.trim() || null,
      company_name: document.getElementById('p-company').value.trim() || null,
      company_start_date: document.getElementById('p-company-start').value || null,
      company_url: document.getElementById('p-company-url').value.trim() || null,
    };

    if (photoUrl) profileData.photo_url = photoUrl;

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    let error;
    if (existing) {
      ({ error } = await supabase.from('profiles').update(profileData).eq('user_id', userId));
    } else {
      ({ error } = await supabase.from('profiles').insert(profileData));
    }

    if (error) {
      showToast('Erro ao salvar perfil: ' + error.message, true);
    } else {
      showToast('Perfil salvo com sucesso!');
    }
  });
}

