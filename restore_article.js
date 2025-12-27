const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xvunmbesvsurmslijlyz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2dW5tYmVzdnN1cm1zbGlqbHl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3NDg5NDgsImV4cCI6MjA4MjMyNDk0OH0.ljxwN09na-_KG0xnbSY57HeqyFhlyci0gu5_1tGGTcE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function restoreArticle() {
  const originalContent = `**Что такое криптобиржа Binance?**

Binance - это популярная онлайн-платформа для обмена криптовалют, которая была основана в 2017 году Чанпеном Чжао, разработчиком программного обеспечения, который до этого работал над многочисленными блокчейн-проектами. Компания Binance стартовала как простая биржа криптовалют, но с течением времени сумела превратиться в одну из наиболее распространенных и надежных платформ в мире.

Площадка позволяет пользователям покупать, продавать и торговать различными криптовалютами, среди которых Bitcoin, Ethereum, Litecoin и многие другие. Binance также предлагает ряд расширенных возможностей для опытных трейдеров, например, маржинальную торговлю, торговлю фьючерсами и опционами. Биржа известна своими невысокими комиссиями, быстрым исполнением ордеров и удобным интерфейсом.


![Screenshot_2](https://xvunmbesvsurmslijlyz.supabase.co/storage/v1/object/public/article-images/1766839057839-wyizik.png)


**Создание биржи Binance и ее владелец**

Binance была создана в 2017 году Чанпеном Чжао, известным также как CZ. Он родился в Китае, а вырос в Канаде. Изучал информатику в Университете Макгилла в Монреале, затем работал в нескольких технологических компаниях, включая Bloomberg и Blockchain.info.

В 2013 году CZ вошел в мир криптовалют, присоединившись к Blockchain.info в качестве руководителя отдела разработки. Позже он основал свою собственную компанию Fusion Systems, которая занималась поставками систем высокочастотной торговли для финансовых учреждений.

Заинтересовавшись технологией блокчейн, CZ решил создать собственную платформу для обмена криптовалют. Он основал Binance в 2017 году и быстро завоевал репутацию предпринимателя с дальновидными взглядами и сторонника криптовалютной индустрии.`;

  const { data, error } = await supabase
    .from('articles')
    .update({ 
      title: 'Binance: полный обзор криптовалютной онлайн-платформы',
      content_md: originalContent
    })
    .eq('id', '3a09ff00-3240-42ab-8c98-1187e35d9afc')
    .select()
    .single();
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Article restored:', data.title);
}

restoreArticle();
