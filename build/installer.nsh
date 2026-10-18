; installer.nsh — personnalise l installateur NSIS d Administration Sandriza.
;
; Force le dossier d'installation par DÉFAUT à « Sandriza » (et non
; « Administration Sandriza ») sous le bon Program Files selon l architecture :
;   64 bits -> C:\Program Files\Sandriza        ($PROGRAMFILES64)
;   32 bits -> C:\Program Files (x86)\Sandriza  ($PROGRAMFILES32)
;
; Mécanisme officiel electron-builder : on écrit InstallLocation dans le
; registre au preInit ; electron-builder lit cette valeur pour fixer $INSTDIR.
; La vue de registre (64/32) suit l'architecture du build, donc chaque variante
; retombe naturellement dans le bon Program Files.

!macro preInit
  SetRegView 64
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES64\Sandriza"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES64\Sandriza"
  SetRegView 32
  WriteRegExpandStr HKLM "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES32\Sandriza"
  WriteRegExpandStr HKCU "${INSTALL_REGISTRY_KEY}" InstallLocation "$PROGRAMFILES32\Sandriza"
!macroend

; ── LA BONNE VERSION POUR CE POSTE (2026-10-17, son signalement) ───────────────
; « Si une personne sur ARM installe le x64, il faut le lui refuser et lui demander
; de télécharger la bonne version. » Windows 11 ARM ÉMULE les programmes x64 et x86 :
; la version x64 s'installait donc sur un poste ARM, et tournait lentement.
; L'installateur lui-même est un programme 32 bits, donc émulé lui aussi : la VRAIE
; architecture du processeur est dans PROCESSOR_ARCHITEW6432 (vide quand le processus
; n'est pas émulé ; on lit alors PROCESSOR_ARCHITECTURE). Valeurs : AMD64, ARM64, x86.
; APP_ARM64 / APP_64 / APP_32 sont posés par electron-builder selon la version bâtie
; (une architecture par installateur). /SD IDOK : en installation silencieuse (mise à
; jour automatique), pas de fenêtre qui attend — mais le flux de mise à jour est déjà
; propre à chaque architecture, ce cas ne se présente pas.
!macro customInit
  ReadEnvStr $R8 PROCESSOR_ARCHITEW6432
  StrCmp $R8 "" 0 +2
    ReadEnvStr $R8 PROCESSOR_ARCHITECTURE
  StrCpy $R9 ""
  StrCmp $R8 "ARM64" 0 +2
    StrCpy $R9 "Windows ARM64 (arm64)"
  StrCmp $R8 "AMD64" 0 +2
    StrCpy $R9 "Windows 64 bits (x64)"
  StrCmp $R8 "x86" 0 +2
    StrCpy $R9 "Windows 32 bits (ia32)"
  StrCmp $R9 "" archOk     ; architecture inconnue : on ne bloque pas
  !ifdef APP_ARM64
    StrCmp $R8 "ARM64" archOk archRefus
  !else ifdef APP_64
    StrCmp $R8 "AMD64" archOk archRefus
  !else ifdef APP_32
    StrCmp $R8 "x86" archOk archRefus
  !else
    Goto archOk
  !endif
  archRefus:
    MessageBox MB_ICONSTOP|MB_OK "Cet installateur n'est pas fait pour ce poste.$\r$\n$\r$\nVotre ordinateur fonctionne sous $R9. Téléchargez la version « $R9 » d'Administration Sandriza sur la page de téléchargement, puis relancez l'installation.$\r$\n$\r$\n—$\r$\n$\r$\nThis installer is not made for this computer. It runs $R9: download the « $R9 » version of Administration Sandriza from the download page, then run the installation again." /SD IDOK
    Quit
  archOk:
!macroend

; ── LE PARE-FEU, RÉGLÉ À L'INSTALLATION (2026-10-17, son signalement) ──────────
; « Une fois l'installation terminée, à sa première ouverture, il demande un accès
; internet et Windows n'aime pas ça : son message bloque la vérification de mise à
; jour. » L'installation se fait DÉJÀ en administrateur (perMachine) : c'est le seul
; moment où l'on peut inscrire l'application au pare-feu sans rien demander. La
; règle porte sur l'exécutable installé, et part avec la désinstallation.
!macro customInstall
  nsExec::Exec 'netsh advfirewall firewall delete rule name="Administration Sandriza"'
  Pop $0
  nsExec::Exec 'netsh advfirewall firewall add rule name="Administration Sandriza" dir=in action=allow program="$INSTDIR\${APP_EXECUTABLE_FILENAME}" enable=yes profile=any'
  Pop $0
!macroend
!macro customUnInstall
  nsExec::Exec 'netsh advfirewall firewall delete rule name="Administration Sandriza"'
  Pop $0
!macroend
