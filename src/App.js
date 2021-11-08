import { useState } from "react";
import { ethers } from "ethers";
import { Form, Input, Button, Card, Avatar, Col, Row } from "antd";
import "antd/dist/antd.css";
import axios from "axios";
import "./styles.css";

const apiKey = 'ckey_4ed95a4079be4cbfac28f761699';

function getRequestUrl(chainId, address) {
  return `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?&key=${apiKey}`;
}

const CardItem = ({ item }) => {
  const balance = ethers.utils.formatUnits(
    item.balance,
    item.contract_decimals
  );
  return (
    <Col span={8} key={item.contract_address}>
      <Card
        title={
          <div>
            <Avatar src={item?.logo_url} style={{ margin: "0 10px" }} />
            <span>{item?.contract_ticker_symbol}</span>
          </div>
        }
      >
        <p>{`contract: ${item?.contract_address}`}</p>
        <p>{`balance: ${balance}`}</p>
        <p>{`rate: ${item?.quote_rate}`}</p>
        <p>{`balance usd: ${item?.quote}`}</p>
      </Card>
    </Col>
  );
};

export default function App() {
  const [form] = Form.useForm();
  const [ethData, setEthData] = useState(null);
  const [bscData, setBscData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const onReset = () => {
    form.resetFields();
    setEthData(null);
    setBscData(null);
  };

  const onFinish = (values) => {
    const ethUrl = getRequestUrl(1, values.address);
    const bscUrl = getRequestUrl(56, values.address);
    setIsLoading(true);
    Promise.all([axios.get(ethUrl), axios.get(bscUrl)])
      .then((rs) => {
        setIsLoading(false);
        setEthData(rs[0].data.data);
        setBscData(rs[1].data.data);
      })
      .catch((error) => {
        setIsLoading(false);
        console.log(error);
      });
  };

  console.log(bscData);

  return (
    <div>
      <div>
        <Form form={form} onFinish={onFinish}>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              disabled={isLoading}
              loading={isLoading}
            >
              Submit
            </Button>
            <Button htmlType="button" onClick={onReset} disabled={isLoading}>
              Reset
            </Button>
          </Form.Item>
        </Form>
      </div>
      {Boolean(ethData) && (
        <div>
          <div>
            <p>{`address: ${ethData.address}`}</p>
            <p>{`updated_at: ${ethData.updated_at}`}</p>
            <p>{`next_update_at: ${ethData.next_update_at}`}</p>
            <p>{`quote_currency: ${ethData.quote_currency}`}</p>
            <p>{`chain_id: ${ethData.chain_id}`}</p>
          </div>
          <div>{`Eth tokens: ${ethData.items.length}`}</div>
          {ethData?.items && ethData.items.length > 0 && (
            <Row gutter={16}>
              {ethData.items.map((item) => (
                <CardItem item={item} />
              ))}
            </Row>
          )}
        </div>
      )}
      {Boolean(bscData) && (
        <div>
          <div>
            <p>{`address: ${bscData.address}`}</p>
            <p>{`updated_at: ${bscData.updated_at}`}</p>
            <p>{`next_update_at: ${bscData.next_update_at}`}</p>
            <p>{`quote_currency: ${bscData.quote_currency}`}</p>
            <p>{`chain_id: ${bscData.chain_id}`}</p>
          </div>
          <div>{`Bsc tokens: ${bscData.items.length}`}</div>
          {bscData?.items && bscData.items.length > 0 && (
            <Row gutter={16}>
              {bscData.items.map((item) => (
                <CardItem item={item} />
              ))}
            </Row>
          )}
        </div>
      )}
    </div>
  );
}
