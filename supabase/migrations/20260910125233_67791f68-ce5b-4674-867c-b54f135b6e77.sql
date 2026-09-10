CREATE POLICY "Anyone can upload support attachments"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'support-attachments');

CREATE POLICY "Signed-in support staff can view attachments"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'support-attachments');

CREATE POLICY "Signed-in support staff can manage attachments"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'support-attachments')
WITH CHECK (bucket_id = 'support-attachments');

CREATE POLICY "Signed-in support staff can remove attachments"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'support-attachments');