insert into t_role_with_authority(role_code, authority_code) 
values('default', 'mainContentQuery'),
('default', 'mainContentSave'),
('default', 'mainContentDel'),
('default', 'mainContentAudit'),
('default', 'mainContentPass'),
('default', 'mainContentNotPass'),
('default', 'mainContentRecovery'),

('admin', 'admin'),
('admin', 'mainContentQuery'),
('admin', 'mainContentSave'),
('admin', 'mainContentDel'),
('admin', 'mainContentAudit'),
('admin', 'mainContentPass'),
('admin', 'mainContentNotPass'),
('admin', 'mainContentRecovery');