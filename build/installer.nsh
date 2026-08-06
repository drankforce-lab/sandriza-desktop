; installer.nsh — personnalise l'installateur NSIS de SANDRIZA Admin.
;
; Force le dossier d'installation par DÉFAUT à « Sandriza » (et non
; « SANDRIZA Admin ») sous le bon Program Files selon l'architecture :
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
