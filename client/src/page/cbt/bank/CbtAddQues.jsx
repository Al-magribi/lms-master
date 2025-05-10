import { useEffect, useState } from "react";
import Layout from "../../../components/layout/Layout";
import Editor from "../../../components/editor/Editor";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAddQuestionMutation,
  useGetQuestionQuery,
} from "../../../controller/api/cbt/ApiBank";
const CbtAddQues = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { subject, name, bankid, questionid } = params;
  const [type, setType] = useState(1);
  const [key, setKey] = useState("");
  const [poin, setPoin] = useState("");
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState({
    choiceA: "",
    choiceB: "",
    choiceC: "",
    choiceD: "",
    choiceE: "",
  });

  const { data: detail } = useGetQuestionQuery(questionid, {
    skip: !questionid,
  });

  const [addQuestion, { isSuccess, isLoading, isError, reset }] =
    useAddQuestionMutation();

  const handleChoiceChange = (choice) => (content) => {
    setChoices((prevChoices) => ({
      ...prevChoices,
      [choice]: content,
    }));
  };

  const addHandler = () => {
    if (!question) {
      toast.error("Pertanyaan tidak boleh kosong");
      return;
    }

    if (type == 1 && !key) {
      toast.error("Kunci jawaban tidak boleh kosong");
      return;
    }

    const data = {
      id: questionid || "",
      bank: bankid,
      qtype: parseInt(type),
      qkey: key,
      poin: parseInt(poin),
      question: question,
      a: choices.choiceA,
      b: choices.choiceB,
      c: choices.choiceC,
      d: choices.choiceD,
      e: choices.choiceE,
    };

    toast.promise(
      addQuestion(data)
        .unwrap()
        .then((res) => res.message),
      {
        loading: "Memuat data ...",
        success: (message) => message,
        error: (error) => error.data.message,
      }
    );
  };

  const goToLink = () => {
    const nameFormat = name.replace(/[\s/]/g, "-");
    const subjectFormat = subject.replace(/[\s/]/g, "-");
    navigate(`/admin-cbt-bank/${subjectFormat}/${nameFormat}/${bankid}`);
  };

  useEffect(() => {
    if (isSuccess) {
      setType(1);
      setKey("");
      setPoin("");
      setQuestion("");
      setChoices({
        choiceA: "",
        choiceB: "",
        choiceC: "",
        choiceD: "",
        choiceE: "",
      });
      reset();
      goToLink();
    }

    if (isError) {
      reset();
    }
  }, [isSuccess, isError]);

  useEffect(() => {
    if (detail) {
      setType(detail?.qtype);
      setKey(detail?.qkey);
      setPoin(detail?.poin);
      setQuestion(detail?.question);
      setChoices({
        choiceA: detail?.a,
        choiceB: detail?.b,
        choiceC: detail?.c,
        choiceD: detail?.d,
        choiceE: detail?.e,
      });
    }
  }, [detail]);

  return (
    <Layout title={"Tambah Soal"} levels={["admin", "teacher"]}>
      <div className="row g-2">
        <div className="col-lg-3 col-12">
          <select
            name="type"
            id="type"
            className="form-select shadow"
            required
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value={1}>PG</option>
            <option value={2}>Essay</option>
          </select>
        </div>
        <div className="col-lg-3 col-12">
          <select
            name="key"
            id="key"
            className="form-select shadow"
            required
            value={key}
            onChange={(e) => setKey(e.target.value)}
          >
            <option value="" hidden>
              Kunci Jawaban
            </option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
            <option value="E">E</option>
          </select>
        </div>
        <div className="col-lg-3 col-12">
          <input
            type="number"
            name="poin"
            id="poin"
            className="form-control shadow"
            placeholder="Nilai"
            value={poin || ""}
            onChange={(e) => setPoin(e.target.value)}
          />
        </div>
        <div className="col-lg-3 col-12 d-flex align-items-center justify-content-start">
          <button
            className="btn btn-sm btn-success shadow"
            disabled={isLoading}
            onClick={addHandler}
          >
            Simpan
          </button>
        </div>
        <div className="col-12">
          <Editor
            placeholder="Ketikan pertanyaan di sini ..."
            value={question}
            onChange={(html) => setQuestion(html)}
            classname="shadow"
            height={300}
          />
        </div>
        {type == 1 &&
          Object.keys(choices).map((choice, index) => (
            <div key={index} className="col-12">
              <Editor
                placeholder={`Jawaban ${choice.charAt(choice.length - 1)}`}
                value={choices[choice]}
                onChange={handleChoiceChange(choice)}
                classname="shadow"
                height={300}
              />
            </div>
          ))}
      </div>
    </Layout>
  );
};

export default CbtAddQues;
