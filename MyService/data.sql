insert into t_authority(code, name, status) 
values('admin','',1),
('mainContentQuery','',1),
('mainContentSave','',1),
('mainContentDel','',1),
('mainContentAudit','',1),
('mainContentPass','',1),
('mainContentNotPass','',1),
('mainContentRecovery','',1);

insert into t_role(code, name, status) 
values('admin','',1),('default','',1);

insert into t_role_with_authority(role_code, authority_code) 
values('default', 'mainContentQuery'),
('default', 'mainContentSave'),
('default', 'mainContentDel'),
('default', 'mainContentRecovery'),

('admin', 'admin'),
('admin', 'mainContentQuery'),
('admin', 'mainContentSave'),
('admin', 'mainContentDel'),
('admin', 'mainContentAudit'),
('admin', 'mainContentPass'),
('admin', 'mainContentNotPass'),
('admin', 'mainContentRecovery');