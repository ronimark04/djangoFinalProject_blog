import { useEffect, useState } from "react";
import { getAllArticles } from "../services/articleService";

function Home() {
    const [isLoading, setIsLoading] = useState(true);
    const [articles, setArticles] = useState([]);


    useEffect(() => {
        setIsLoading(true);
        getAllArticles()
            .then((res) => {
                setArticles(res.data);
            })
            .catch((err) => console.error(err))
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    console.log(articles);


    return (<>

    </>);
}

export default Home;