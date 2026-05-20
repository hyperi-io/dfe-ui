import { IconUpload } from '@repo/dfe-icons';
import { Upload, UploadFile, UploadProps } from 'antd';
import { RcFile, UploadChangeParam } from 'antd/es/upload';
import { useState } from 'react';

type FileUploadDraggerProps = UploadProps;

export const FileUploadDragger = ({
  onRemove,
  onChange,
  beforeUpload,
  ...props
}: FileUploadDraggerProps) => {
  const [fileList, setFileList] = useState<UploadFile<RcFile>[]>([]);

  const handleRemove = (file: UploadFile<RcFile>) => {
    const newFileList = fileList?.filter((f) => f.uid !== file.uid) ?? [];
    setFileList(newFileList);
    onRemove?.(file);
    onChange?.({
      fileList: newFileList,
    } as unknown as UploadChangeParam<UploadFile<RcFile>>);
  };

  const handleChange = (info: UploadChangeParam<UploadFile<RcFile>>) => {
    setFileList(info.fileList as UploadFile<RcFile>[]);
    onChange?.(info as UploadChangeParam<UploadFile<RcFile>>);
  };

  const handleBeforeUpload = (file: RcFile) => {
    const entry: UploadFile<RcFile> = {
      uid: file.uid,
      name: file.name,
      status: 'done',
      originFileObj: file,
    };
    setFileList((prev) => [...prev, entry]);
    beforeUpload?.(file, fileList as unknown as RcFile[]);
    return false;
  };

  return (
    <Upload.Dragger
      {...props}
      fileList={fileList}
      onRemove={handleRemove}
      onChange={handleChange}
      beforeUpload={handleBeforeUpload}
    >
      <IconUpload className="m-auto" fontSize={24} />

      <p className="ant-upload-text">
        Click or drag a file to this area to upload
      </p>
      <p className="ant-upload-hint">Only single upload is supported.</p>
    </Upload.Dragger>
  );
};
