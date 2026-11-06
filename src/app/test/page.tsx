"use client";
import { Input } from "@base-ui/react";
import Image from "next/image";
import React, { useEffect useState } from "react";

const TestPage = () => {
  const [file, setFile] = useState("");

  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }

    const newUrl = URL.createObjectURL(file);
    setUrl(newUrl);

    return () => URL.revokeObjectURL(newUrl); // освобождаем память
  }, [file]);

  return (
    <div>
      {url && <Image src={url} width={100} height={100} alt="Test" />}

      <Input
        placeholder="test"
        type="file"
        onChange={(e) => setFile(e.target.files?.[0])}
      />
    </div>
  );
};

export default TestPage;
